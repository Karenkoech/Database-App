/**
 * Script to create sample Excel files with database scripts for testing the Audit Tool
 * Run: node scripts/create-sample-excel.js
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../sample-scripts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createExcelFromRows(filename, sheets) {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(({ name, rows }) => {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });
  
  const filepath = path.join(OUTPUT_DIR, filename);
  XLSX.writeFile(workbook, filepath);
  console.log(`✅ Created: ${filename}`);
}

// ============ MS SQL SERVER SCRIPTS ============
const msSqlScripts = [
  { name: 'MS SQL - Stored Procedures', rows: [
    ['-- MS SQL Server: Sample Stored Procedures for Audit'],
    [''],
    ['CREATE PROCEDURE dbo.GetUserByID @UserID INT'],
    ['AS'],
    ['BEGIN'],
    ['    -- Potential SQL Injection if @UserID not validated'],
    ['    SELECT * FROM Users WHERE UserID = @UserID'],
    ['END'],
    ['GO'],
    [''],
    ['-- Hardcoded credentials - HIGH RISK'],
    ['EXEC sp_addlinkedserver @server = "LINKED_SRV", @srvproduct = "",'],
    ['    @provider = "SQLNCLI", @datasrc = "192.168.1.100", @catalog = "prod_db"'],
    [''],
    ['-- Granting excessive privileges'],
    ['GRANT ALL PRIVILEGES ON DATABASE::ProductionDB TO Public'],
    [''],
    ['-- Dynamic SQL - review for injection'],
    ['DECLARE @sql NVARCHAR(MAX)'],
    ['SET @sql = "SELECT * FROM " + @TableName'],
    ['EXEC sp_executesql @sql'],
    [''],
    ['-- Good: Parameterized query'],
    ['SELECT UserName, Email FROM Users WHERE Status = @Status AND CreatedDate > @StartDate'],
  ]},
  { name: 'MS SQL - Schema & Security', rows: [
    ['-- MS SQL: Schema and Security Scripts'],
    [''],
    ['-- DROP statements - requires change control'],
    ['DROP TABLE IF EXISTS dbo.TempAuditLog'],
    ['DROP PROCEDURE dbo.legacy_sp_GetData'],
    [''],
    ['-- Password in connection string'],
    ['-- Connection: Server=prod;Database=AuditDB;User=sa;Password=Admin123!'],
    [''],
    ['-- TODO: Remove debug code before production'],
    ['-- FIXME: Add proper error handling'],
    [''],
    ['CREATE USER audit_reader FOR LOGIN audit_reader WITHOUT PASSWORD'],
    [''],
    ['-- Unconditional DELETE - dangerous'],
    ['DELETE FROM AuditLog WHERE 1=1'],
  ]},
];

// ============ SAP HANA SCRIPTS ============
const hanaScripts = [
  { name: 'HANA - Procedures', rows: [
    ['-- SAP HANA: Sample Procedures and Scripts'],
    [''],
    ['CREATE PROCEDURE "SCHEMA"."GET_CUSTOMER_DATA" (IN p_customer_id NVARCHAR(10))'],
    ['LANGUAGE SQLSCRIPT AS'],
    ['BEGIN'],
    ['    -- Direct table access - review permissions'],
    ['    SELECT * FROM "SCHEMA"."CUSTOMERS" WHERE CUSTOMER_ID = :p_customer_id'],
    ['END'],
    [''],
    ['-- HANA: Grant all on schema'],
    ['GRANT ALL PRIVILEGES ON SCHEMA "PROD_SCHEMA" TO "PUBLIC_ROLE"'],
    [''],
    ['-- HANA: Potential privilege escalation'],
    ['CALL GRANT_ACTIVATED_ROLE("SYS.BI_*", "APPLICATION_USER")'],
    [''],
    ['-- HANA: Export/Import - audit data movement'],
    ['EXPORT "SCHEMA"."SENSITIVE_TABLE" INTO "/tmp/export"'],
    [''],
    ['-- Good: Using parameters'],
    ['SELECT * FROM AUDIT_LOG WHERE USER_NAME = :current_user AND LOG_DATE > ADD_DAYS(CURRENT_DATE, -30)'],
  ]},
  { name: 'HANA - DDL & Config', rows: [
    ['-- SAP HANA: DDL and Configuration'],
    [''],
    ['ALTER SYSTEM ALTER CONFIGURATION ("global.ini", "SYSTEM") SET ("memory", "allocationlimit") = "80"'],
    [''],
    ['-- CREATE TABLE with default privileges'],
    ['CREATE TABLE "SCHEMA"."PAYMENT_DATA" (ID INTEGER, CARD_NUMBER NVARCHAR(20), AMOUNT DECIMAL)'],
    [''],
    ['-- DELETE without WHERE - HIGH RISK'],
    ['DELETE FROM "SCHEMA"."TEMP_SESSIONS"'],
    [''],
    ['-- REVOKE then GRANT - audit trail'],
    ['REVOKE SELECT ON "SCHEMA"."EMPLOYEES" FROM "OLD_APP_ROLE"'],
    ['GRANT SELECT ON "SCHEMA"."EMPLOYEES" TO "NEW_APP_ROLE"'],
    [''],
    ['-- HANA: Direct system access'],
    ['SELECT * FROM M_DATABASE'],
  ]},
];

// ============ ORACLE SCRIPTS ============
const oracleScripts = [
  { name: 'Oracle - PLSQL', rows: [
    ['-- Oracle: PL/SQL Procedures'],
    [''],
    ['CREATE OR REPLACE PROCEDURE get_employee (p_emp_id IN NUMBER) IS'],
    ['BEGIN'],
    ['    -- Dynamic SQL - injection risk'],
    ['    EXECUTE IMMEDIATE "SELECT * FROM emp WHERE id = " || p_emp_id'],
    ['END;'],
    ['/'],
    [''],
    ['-- Grant DBA to application - CRITICAL'],
    ['GRANT DBA TO app_service_account'],
    [''],
    ['-- Password in trigger'],
    ['-- OLD: v_password := "Welcome1"'],
    [''],
    ['-- Unrestricted DELETE'],
    ['DELETE FROM audit_trail'],
    ['COMMIT'],
    [''],
    ['-- Good: Bind variables'],
    ['SELECT * FROM users WHERE status = :1 AND created > :2'],
  ]},
  { name: 'Oracle - DBA Scripts', rows: [
    ['-- Oracle: DBA and Schema Scripts'],
    [''],
    ['DROP USER old_app CASCADE'],
    [''],
    ['CREATE USER new_app IDENTIFIED BY TempPass123'],
    [''],
    ['-- Grant all on schema'],
    ['GRANT ALL PRIVILEGES ON SCHEMA hr TO app_user'],
    [''],
    ['-- SELECT * in production code'],
    ['SELECT * FROM dba_users WHERE username = "SYS"'],
    [''],
    ['-- TODO: Implement proper encryption'],
    ['-- FIXME: Remove hardcoded connection string'],
  ]},
];

// ============ POSTGRESQL SCRIPTS ============
const postgresScripts = [
  { name: 'PostgreSQL - Functions', rows: [
    ['-- PostgreSQL: Functions and Security'],
    [''],
    ['CREATE FUNCTION get_user_data(user_id INT) RETURNS TABLE AS'],
    ['$func$'],
    ['SELECT * FROM users WHERE id = user_id'],
    ['$func$ LANGUAGE sql'],
    [''],
    ['-- Superuser grant - HIGH RISK'],
    ['ALTER USER app_user WITH SUPERUSER'],
    [''],
    ['-- Unvalidated input in function'],
    ['EXECUTE format("SELECT * FROM %I", tablename)'],
    [''],
    ['-- TRUNCATE without backup'],
    ['TRUNCATE TABLE audit_logs CASCADE'],
    [''],
    ['-- Good: Parameterized'],
    ['SELECT * FROM orders WHERE customer_id = $1 AND status = $2'],
  ]},
];

// ============ MIXED / REAL-WORLD SCENARIOS ============
const mixedScripts = [
  { name: 'Real-World Audit Samples', rows: [
    ['-- Mixed: Scripts commonly found in audits'],
    [''],
    ['-- MS SQL: Backup script with credentials'],
    ['BACKUP DATABASE ProdDB TO DISK = "\\\\file-server\\backup\\prod.bak"'],
    ['-- Credentials in job: sa / P@ssw0rd!'],
    [''],
    ['-- HANA: Report procedure'],
    ['SELECT CUSTOMER_ID, CARD_NUMBER, TRANSACTION_AMOUNT'],
    ['FROM "FINANCE"."TRANSACTIONS"'],
    ['WHERE TRANSACTION_DATE > ADD_MONTHS(CURRENT_DATE, -1)'],
    [''],
    ['-- Oracle: Batch delete'],
    ['DELETE FROM staging_table WHERE 1=1'],
    ['-- TODO: Add proper WHERE clause'],
    [''],
    ['-- PostgreSQL: Role assignment'],
    ['GRANT ALL ON ALL TABLES IN SCHEMA public TO reporting_user'],
    [''],
    ['-- Common: SELECT * usage'],
    ['SELECT * FROM dbo.ApplicationLog'],
    ['SELECT * FROM "SCHEMA"."SENSITIVE_DATA"'],
  ]},
];

// Create the Excel files
console.log('\n📁 Creating sample database script Excel files...\n');

createExcelFromRows('01_MS_SQL_Server_Scripts.xlsx', msSqlScripts);
createExcelFromRows('02_SAP_HANA_Scripts.xlsx', hanaScripts);
createExcelFromRows('03_Oracle_Scripts.xlsx', oracleScripts);
createExcelFromRows('04_PostgreSQL_Scripts.xlsx', postgresScripts);
createExcelFromRows('05_Mixed_RealWorld_Scripts.xlsx', mixedScripts);

console.log(`\n✅ Done! Files saved to: ${OUTPUT_DIR}`);
console.log('\nUpload these to your Database Audit Tool at http://localhost:3000');
console.log('The tool will flag: hardcoded passwords, GRANT ALL, DROP, DELETE, SELECT *, etc.\n');
