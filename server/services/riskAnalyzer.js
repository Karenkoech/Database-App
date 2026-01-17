export function assessRisk(issues) {
  if (!issues || issues.length === 0) {
    return {
      totalIssues: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      riskScore: 0,
      overallRisk: 'Low'
    };
  }

  const riskCounts = {
    high: 0,
    medium: 0,
    low: 0
  };

  issues.forEach(issue => {
    const severity = issue.severity?.toLowerCase() || 'low';
    if (severity === 'high') riskCounts.high++;
    else if (severity === 'medium') riskCounts.medium++;
    else riskCounts.low++;
  });

  // Calculate risk score (0-100)
  const riskScore = Math.min(100, 
    (riskCounts.high * 10) + 
    (riskCounts.medium * 5) + 
    (riskCounts.low * 1)
  );

  // Determine overall risk level
  let overallRisk = 'Low';
  if (riskCounts.high > 0 || riskScore > 50) {
    overallRisk = 'High';
  } else if (riskCounts.medium > 2 || riskScore > 25) {
    overallRisk = 'Medium';
  }

  return {
    totalIssues: issues.length,
    highRisk: riskCounts.high,
    mediumRisk: riskCounts.medium,
    lowRisk: riskCounts.low,
    riskScore: riskScore,
    overallRisk: overallRisk,
    criticalIssues: issues.filter(i => i.severity?.toLowerCase() === 'high')
  };
}
