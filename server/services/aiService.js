import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Detect database types from script content
 */
export function detectDatabaseTypes(content) {
  const types = [];
  if (/\b(GO|T-SQL|sp_|dbo\.|NVARCHAR|nchar|GETDATE|ISNULL)\b/i.test(content) || /\bEXEC\s+sp_/i.test(content)) types.push('MS SQL Server');
  if (/\b(ADD_DAYS|ADD_MONTHS|SCHEMA|HANA|LANGUAGE SQLSCRIPT)\b/i.test(content) || /"SCHEMA"\."TABLE"/i.test(content)) types.push('SAP HANA');
  if (/\b(PL\/SQL|EXECUTE IMMEDIATE|dba_|v\$|NUMBER|VARCHAR2|NVL|SYSDATE)\b/i.test(content)) types.push('Oracle');
  if (/\b(\\$[0-9]|\\$func\\$|LANGUAGE plpgsql|::integer|::text)\b/i.test(content) || /\bSERIAL\b/i.test(content)) types.push('PostgreSQL');
  if (/\b(MYSQL|AUTO_INCREMENT|ENGINE=InnoDB)\b/i.test(content)) types.push('MySQL');
  if (/\b(SQLITE|INTEGER PRIMARY KEY|WITHOUT ROWID|sqlite_master|sqlite_sequence)\b/i.test(content) || /\.db\b/i.test(content)) types.push('SQLite');
  if (types.length === 0 && (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b/i.test(content))) types.push('SQL (generic)');
  return [...new Set(types)];
}

/**
 * Analyze database scripts with AI - supports real-world Excel exports (MS SQL, HANA, Oracle, etc.)
 */
export async function analyzeScript(scriptContent, options = {}) {
  const { filename = '', source = 'upload', dbType = '' } = options;
  const isFromExcel = /\.(xlsx|xls)$/i.test(filename);

  if (!openai || !process.env.OPENAI_API_KEY) {
    console.log('⚠️  No OpenAI API key. Using enhanced pattern analysis.');
    return performBasicAnalysis(scriptContent, { filename, isFromExcel, dbType });
  }

  try {
    const dbTypeContext = dbType ? `The user has specified this is from **${dbType}**. ` : '';
    const prompt = `You are an expert IT auditor analyzing REAL-WORLD database scripts and outputs. ${dbTypeContext}The content may come from Excel exports of: stored procedures, DDL/DML scripts, query results, schema dumps, or configuration from MS SQL Server, SAP HANA, Oracle, PostgreSQL, or other databases.

**Your task:**
1. **Analysis Overview**: Provide a brief executive summary of what this output contains (e.g., "Stored procedures and GRANT statements from MS SQL", "HANA procedure definitions and schema changes").
2. **Database Types**: Identify which database(s) the scripts target.
3. **What the scripts do**: Summarize the main operations (CREATE, SELECT, DROP, GRANT, etc.).
4. **Issues**: For each finding, include: type, severity (High/Medium/Low), description, location (sheet/line if from Excel), impact, recommendation.

**Content to analyze** (from ${isFromExcel ? 'Excel file: ' + filename : 'uploaded file'}):
\`\`\`
${scriptContent.substring(0, 12000)}
\`\`\`

Return ONLY valid JSON with this exact structure:
{
  "overview": "1-2 sentence executive summary of what was analyzed",
  "databaseTypes": ["MS SQL Server", "SAP HANA", etc.],
  "scriptPurpose": "Brief description of main operations found",
  "summary": "Overall risk assessment and key takeaways",
  "issues": [
    {
      "type": "Security|Compliance|Performance|Best Practice|Configuration",
      "severity": "High|Medium|Low",
      "description": "Clear description",
      "location": "Sheet name, cell, or line reference",
      "impact": "Business/technical impact",
      "recommendation": "Concrete fix or next step"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert IT auditor for database security and compliance. Analyze scripts from MS SQL, HANA, Oracle, PostgreSQL. Respond with valid JSON only, no markdown."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 3000
    });

    const responseText = completion.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Use selected DB type if provided, otherwise detect
      if (dbType) {
        parsed.databaseTypes = [dbType];
      } else if (!parsed.databaseTypes || parsed.databaseTypes.length === 0) {
        parsed.databaseTypes = detectDatabaseTypes(scriptContent);
      }
      if (!parsed.overview) parsed.overview = parsed.summary || 'Analysis complete.';
      if (!parsed.scriptPurpose) parsed.scriptPurpose = 'Various database operations.';
      return parsed;
    }
    const detectedTypes = dbType ? [dbType] : detectDatabaseTypes(scriptContent);
    return {
      overview: responseText.substring(0, 500),
      databaseTypes: detectedTypes,
      scriptPurpose: 'See overview.',
      summary: responseText,
      issues: extractIssuesFromText(responseText)
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return performBasicAnalysis(scriptContent, { filename, isFromExcel });
  }
}

function performBasicAnalysis(scriptContent, options = {}) {
  const filename = options.filename || '';
  const isFromExcel = options.isFromExcel ?? /\.(xlsx|xls)$/i.test(filename);
  const selectedDbType = options.dbType || '';
  const issues = [];
  const lines = scriptContent.split('\n');

  const patterns = [
    { pattern: /password\s*=\s*['"][^'"]+['"]/i, type: 'Security', severity: 'High', desc: 'Hardcoded password detected' },
    { pattern: /DROP\s+(TABLE|DATABASE|USER)/i, type: 'Security', severity: 'High', desc: 'DROP statement - data/loss risk' },
    { pattern: /DELETE\s+FROM\s+\w+\s+WHERE\s+1\s*=\s*1/i, type: 'Security', severity: 'High', desc: 'Unconditional DELETE' },
    { pattern: /DELETE\s+FROM\s+\w+\s*;?\s*$/im, type: 'Security', severity: 'High', desc: 'DELETE without WHERE clause' },
    { pattern: /SELECT\s+\*\s+FROM/i, type: 'Best Practice', severity: 'Medium', desc: 'SELECT * - specify columns' },
    { pattern: /--\s*TODO|FIXME/i, type: 'Best Practice', severity: 'Low', desc: 'TODO/FIXME - incomplete' },
    { pattern: /GRANT\s+ALL\s+(PRIVILEGES|ON)/i, type: 'Security', severity: 'High', desc: 'GRANT ALL - excessive privileges' },
    { pattern: /GRANT\s+(DBA|SUPERUSER)/i, type: 'Security', severity: 'High', desc: 'Granting DBA/SUPERUSER' },
    { pattern: /CREATE\s+USER.*WITHOUT\s+PASSWORD/i, type: 'Security', severity: 'High', desc: 'User without password' },
    { pattern: /EXECUTE\s+IMMEDIATE\s+['"][^'"]*\+/i, type: 'Security', severity: 'High', desc: 'Dynamic SQL - injection risk' },
    { pattern: /EXEC\s+sp_executesql|format\s*\(\s*['"]/i, type: 'Security', severity: 'Medium', desc: 'Dynamic SQL - review' },
    { pattern: /TRUNCATE\s+TABLE/i, type: 'Security', severity: 'Medium', desc: 'TRUNCATE - verify intent' },
  ];

  lines.forEach((line, index) => {
    patterns.forEach(({ pattern, type, severity, desc }) => {
      if (pattern.test(line)) {
        const loc = isFromExcel ? `Sheet/Row ${index + 1}` : `Line ${index + 1}`;
        issues.push({
          type,
          severity,
          description: desc,
          location: `${loc}: ${line.trim().substring(0, 60)}`,
          impact: 'Requires review',
          recommendation: 'Review and remediate before production'
        });
      }
    });
  });

  // Use selected DB type if provided, otherwise detect
  const dbTypes = selectedDbType ? [selectedDbType] : detectDatabaseTypes(scriptContent);
  const highCount = issues.filter(i => i.severity === 'High').length;

  return {
    overview: `Analyzed ${isFromExcel ? 'Excel export' : 'script'}${filename ? ': ' + filename : ''}. ${dbTypes.length ? 'Database: ' + dbTypes.join(', ') + '.' : ''}`,
    databaseTypes: dbTypes,
    scriptPurpose: 'DDL, DML, and/or procedure definitions extracted for audit.',
    summary: issues.length > 0
      ? `Found ${issues.length} potential issues (${highCount} high). ${highCount ? 'Address high-severity items first.' : ''} ${!process.env.OPENAI_API_KEY ? 'Add OpenAI API key for deeper AI analysis.' : ''}`
      : 'No obvious issues from pattern scan. Manual review and AI (with API key) recommended.',
    issues
  };
}

function extractIssuesFromText(text) {
  return [{
    type: 'Analysis',
    severity: 'Medium',
    description: 'AI analysis completed. Review the summary for details.',
    location: 'N/A',
    impact: 'See summary',
    recommendation: 'Review the full analysis'
  }];
}
