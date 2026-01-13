#!/bin/bash

#===============================================================================
# VAPT (Vulnerability Assessment and Penetration Testing) Script
# Uses free security tools: OWASP ZAP, nikto, nuclei, and custom checks
#
# Prerequisites:
#   - Docker (for OWASP ZAP): brew install docker
#   - nikto: brew install nikto
#   - nuclei: brew install nuclei
#
# Usage:
#   ./scripts/security-scan.sh                    # Full scan
#   ./scripts/security-scan.sh --quick            # Quick scan only
#   ./scripts/security-scan.sh --api-only         # API tests only
#===============================================================================

set -e

# Configuration
API_URL="${API_URL:-https://grubtech-api.shady-ehab.workers.dev}"
FRONTEND_URL="${FRONTEND_URL:-https://main-grubtech-website.pages.dev}"
REPORT_DIR="reports/security"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Grubtech VAPT Security Scan${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Report Directory: $REPORT_DIR"
echo ""

#===============================================================================
# 1. Custom Security Checks (No Dependencies)
#===============================================================================
echo -e "${YELLOW}[1/5] Running Custom Security Checks...${NC}"

custom_report="$REPORT_DIR/custom-checks-$TIMESTAMP.txt"

{
  echo "============================================"
  echo "Custom Security Checks Report"
  echo "Generated: $(date)"
  echo "============================================"
  echo ""

  # Check Security Headers
  echo "=== Security Headers Check ==="
  headers=$(curl -sI "$API_URL/api/health" 2>/dev/null)

  check_header() {
    local header=$1
    local expected=$2
    if echo "$headers" | grep -qi "$header"; then
      echo "[PASS] $header header present"
      return 0
    else
      echo "[FAIL] $header header missing"
      return 1
    fi
  }

  check_header "X-Content-Type-Options"
  check_header "X-Frame-Options"
  check_header "Strict-Transport-Security"
  check_header "X-XSS-Protection"
  check_header "Referrer-Policy"
  check_header "Content-Security-Policy" || true
  check_header "Permissions-Policy"

  echo ""

  # Check CORS Configuration
  echo "=== CORS Configuration Check ==="
  cors_test=$(curl -sI -H "Origin: https://evil-site.com" "$API_URL/api/health" 2>/dev/null)
  if echo "$cors_test" | grep -qi "access-control-allow-origin: https://evil-site.com"; then
    echo "[FAIL] CORS allows arbitrary origins (potential security issue)"
  else
    echo "[PASS] CORS does not allow arbitrary origins"
  fi

  echo ""

  # Check for Information Disclosure
  echo "=== Information Disclosure Check ==="

  # Server header
  if echo "$headers" | grep -qi "^Server:"; then
    server_value=$(echo "$headers" | grep -i "^Server:" | head -1)
    echo "[WARN] Server header exposed: $server_value"
  else
    echo "[PASS] Server header not exposed"
  fi

  # X-Powered-By header
  if echo "$headers" | grep -qi "X-Powered-By"; then
    echo "[FAIL] X-Powered-By header exposed"
  else
    echo "[PASS] X-Powered-By header not exposed"
  fi

  echo ""

  # Check Authentication Endpoints
  echo "=== Authentication Security Check ==="

  # Test login endpoint for rate limiting
  echo "Testing rate limiting on /api/auth/login..."
  rate_limit_hit=false
  for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d '{"username":"test","password":"test"}' \
      "$API_URL/api/auth/login" 2>/dev/null)
    if [ "$response" = "429" ]; then
      rate_limit_hit=true
      break
    fi
  done

  if [ "$rate_limit_hit" = true ]; then
    echo "[PASS] Rate limiting is active on authentication endpoint"
  else
    echo "[INFO] Rate limiting not triggered (may need more requests)"
  fi

  # Test for verbose error messages
  login_error=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"nonexistent","password":"wrong"}' \
    "$API_URL/api/auth/login" 2>/dev/null)

  if echo "$login_error" | grep -qi "stack\|trace\|debug"; then
    echo "[FAIL] Verbose error messages in authentication response"
  else
    echo "[PASS] No verbose error messages in authentication response"
  fi

  echo ""

  # Check for Common Vulnerabilities
  echo "=== Common Vulnerability Check ==="

  # SQL Injection test (basic)
  sqli_test=$(curl -s "$API_URL/api/integrations?category=test'%20OR%201=1--" 2>/dev/null)
  if echo "$sqli_test" | grep -qi "error\|syntax\|mysql\|sqlite"; then
    echo "[WARN] Possible SQL injection vulnerability detected"
  else
    echo "[PASS] No obvious SQL injection vulnerability"
  fi

  # Path Traversal test
  path_test=$(curl -s "$API_URL/uploads/../../../etc/passwd" 2>/dev/null)
  if echo "$path_test" | grep -qi "root:"; then
    echo "[FAIL] Path traversal vulnerability detected"
  else
    echo "[PASS] Path traversal blocked"
  fi

  # XSS in parameters (reflected)
  xss_test=$(curl -s "$API_URL/api/integrations?category=<script>alert(1)</script>" 2>/dev/null)
  if echo "$xss_test" | grep -qi "<script>"; then
    echo "[WARN] Possible reflected XSS vulnerability"
  else
    echo "[PASS] XSS payloads appear to be handled"
  fi

  echo ""

  # Check Cookie Security
  echo "=== Cookie Security Check ==="
  login_response=$(curl -s -c - -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    "$API_URL/api/auth/login" 2>/dev/null || true)

  if echo "$login_response" | grep -qi "httponly"; then
    echo "[PASS] Cookies have HttpOnly flag"
  else
    echo "[INFO] Could not verify HttpOnly flag (may require valid credentials)"
  fi

  if echo "$login_response" | grep -qi "secure"; then
    echo "[PASS] Cookies have Secure flag"
  else
    echo "[INFO] Could not verify Secure flag (may require valid credentials)"
  fi

  if echo "$login_response" | grep -qi "samesite"; then
    echo "[PASS] Cookies have SameSite attribute"
  else
    echo "[INFO] Could not verify SameSite attribute"
  fi

  echo ""

  # Check for Open Redirects
  echo "=== Open Redirect Check ==="
  redirect_test=$(curl -sI "$API_URL/api/redirect?url=https://evil.com" 2>/dev/null)
  if echo "$redirect_test" | grep -qi "Location: https://evil.com"; then
    echo "[FAIL] Open redirect vulnerability detected"
  else
    echo "[PASS] No open redirect vulnerability found"
  fi

  echo ""
  echo "=== Custom Checks Complete ==="

} > "$custom_report" 2>&1

cat "$custom_report"
echo -e "${GREEN}Custom checks saved to: $custom_report${NC}"
echo ""

#===============================================================================
# 2. OWASP ZAP Scan (via Docker)
#===============================================================================
echo -e "${YELLOW}[2/5] Running OWASP ZAP Scan...${NC}"

zap_report="$REPORT_DIR/zap-report-$TIMESTAMP.html"

if command -v docker &> /dev/null; then
  echo "Starting OWASP ZAP baseline scan..."

  # Run ZAP baseline scan
  docker run --rm -v "$(pwd)/$REPORT_DIR:/zap/wrk:rw" \
    -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
    -t "$API_URL" \
    -r "zap-report-$TIMESTAMP.html" \
    -J "zap-report-$TIMESTAMP.json" \
    -I \
    2>&1 || true

  if [ -f "$zap_report" ]; then
    echo -e "${GREEN}ZAP report saved to: $zap_report${NC}"
  else
    echo -e "${YELLOW}ZAP scan completed (check Docker output for details)${NC}"
  fi
else
  echo -e "${YELLOW}Docker not found. Skipping OWASP ZAP scan.${NC}"
  echo "Install Docker to enable ZAP scanning: https://docs.docker.com/get-docker/"
fi

echo ""

#===============================================================================
# 3. Nikto Web Server Scan
#===============================================================================
echo -e "${YELLOW}[3/5] Running Nikto Scan...${NC}"

nikto_report="$REPORT_DIR/nikto-report-$TIMESTAMP.txt"

if command -v nikto &> /dev/null; then
  echo "Starting Nikto scan..."
  nikto -h "$API_URL" -output "$nikto_report" -Format txt -Tuning 1234567890abc 2>&1 || true

  if [ -f "$nikto_report" ]; then
    echo -e "${GREEN}Nikto report saved to: $nikto_report${NC}"
  fi
else
  echo -e "${YELLOW}Nikto not found. Skipping Nikto scan.${NC}"
  echo "Install nikto: brew install nikto"
fi

echo ""

#===============================================================================
# 4. Nuclei Vulnerability Scanner
#===============================================================================
echo -e "${YELLOW}[4/5] Running Nuclei Scan...${NC}"

nuclei_report="$REPORT_DIR/nuclei-report-$TIMESTAMP.txt"

if command -v nuclei &> /dev/null; then
  echo "Updating Nuclei templates..."
  nuclei -update-templates -silent 2>&1 || true

  echo "Starting Nuclei scan..."
  nuclei -u "$API_URL" \
    -severity low,medium,high,critical \
    -o "$nuclei_report" \
    -silent \
    2>&1 || true

  if [ -f "$nuclei_report" ] && [ -s "$nuclei_report" ]; then
    echo -e "${GREEN}Nuclei report saved to: $nuclei_report${NC}"
    cat "$nuclei_report"
  else
    echo -e "${GREEN}No vulnerabilities found by Nuclei${NC}"
  fi
else
  echo -e "${YELLOW}Nuclei not found. Skipping Nuclei scan.${NC}"
  echo "Install nuclei: brew install nuclei"
fi

echo ""

#===============================================================================
# 5. Generate Summary Report
#===============================================================================
echo -e "${YELLOW}[5/5] Generating Summary Report...${NC}"

summary_report="$REPORT_DIR/summary-$TIMESTAMP.md"

{
  echo "# Grubtech VAPT Security Scan Report"
  echo ""
  echo "**Generated:** $(date)"
  echo "**API URL:** $API_URL"
  echo "**Frontend URL:** $FRONTEND_URL"
  echo ""
  echo "## Executive Summary"
  echo ""
  echo "This report contains the results of automated security scanning using multiple tools."
  echo ""
  echo "## Tools Used"
  echo ""
  echo "| Tool | Status | Report |"
  echo "|------|--------|--------|"
  echo "| Custom Checks | ✅ Completed | $custom_report |"

  if [ -f "$zap_report" ]; then
    echo "| OWASP ZAP | ✅ Completed | $zap_report |"
  else
    echo "| OWASP ZAP | ⏭️ Skipped | Docker not available |"
  fi

  if [ -f "$nikto_report" ]; then
    echo "| Nikto | ✅ Completed | $nikto_report |"
  else
    echo "| Nikto | ⏭️ Skipped | Not installed |"
  fi

  if [ -f "$nuclei_report" ]; then
    echo "| Nuclei | ✅ Completed | $nuclei_report |"
  else
    echo "| Nuclei | ⏭️ Skipped | Not installed |"
  fi

  echo ""
  echo "## Security Headers"
  echo ""
  echo "The following security headers were checked:"
  echo ""
  echo "- X-Content-Type-Options"
  echo "- X-Frame-Options"
  echo "- Strict-Transport-Security"
  echo "- X-XSS-Protection"
  echo "- Referrer-Policy"
  echo "- Permissions-Policy"
  echo ""
  echo "## Recommendations"
  echo ""
  echo "1. Review all WARN and FAIL findings in the detailed reports"
  echo "2. Implement any missing security headers"
  echo "3. Ensure rate limiting is properly configured"
  echo "4. Regular security scanning should be part of CI/CD pipeline"
  echo "5. Consider professional penetration testing for comprehensive assessment"
  echo ""
  echo "## Disclaimer"
  echo ""
  echo "This automated scan provides a baseline security assessment. It is not a substitute"
  echo "for comprehensive manual penetration testing by security professionals."

} > "$summary_report"

echo -e "${GREEN}Summary report saved to: $summary_report${NC}"
echo ""

#===============================================================================
# Final Output
#===============================================================================
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Security Scan Complete${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Reports generated in: $REPORT_DIR/"
echo ""
ls -la "$REPORT_DIR/"*"$TIMESTAMP"* 2>/dev/null || echo "No reports generated"
echo ""
echo -e "${GREEN}Done!${NC}"
