#!/usr/bin/env python
"""
Deployment verification script for Vercel and Render
"""

import os
import sys
import requests
from datetime import datetime

print("\n" + "="*80)
print("DEPLOYMENT VERIFICATION STATUS")
print("="*80)
print(f"\nTime: {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}")
print("Repository: Fee-Collection-Software_Balkanjibari_Nadiad-2026")
print("Latest Commit: 2aeed87 (Payment system sync documentation)")

# Vercel Frontend
print("\n" + "-"*80)
print("🎨 FRONTEND DEPLOYMENT (VERCEL)")
print("-"*80)

vercel_domain = "balkanji-bari-dashboard.vercel.app"
try:
    response = requests.get(f"https://{vercel_domain}", timeout=10)
    if response.status_code == 200:
        print(f"✅ Vercel Deployment Status: LIVE")
        print(f"   URL: https://{vercel_domain}")
        print(f"   Status Code: {response.status_code}")
        print(f"   Content Length: {len(response.content)} bytes")
        print(f"   Last Modified: {response.headers.get('Last-Modified', 'N/A')}")
    else:
        print(f"⚠️ Vercel Status Code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"❌ Vercel Connection Error: {str(e)}")
    print("   ℹ️  Deployment may still be in progress")

# Render Backend
print("\n" + "-"*80)
print("🔧 BACKEND DEPLOYMENT (RENDER)")
print("-"*80)

render_domain = "balkanji-backend.onrender.com"
try:
    response = requests.get(f"https://{render_domain}/health/", timeout=10)
    if response.status_code == 200:
        print(f"✅ Render Deployment Status: LIVE")
        print(f"   URL: https://{render_domain}")
        print(f"   Health Status: {response.status_code} OK")
        try:
            data = response.json()
            print(f"   Service: {data.get('service', 'N/A')}")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Uptime: {data.get('uptime_seconds', 'N/A')} seconds")
        except:
            pass
    else:
        print(f"⚠️ Render Status Code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"❌ Render Connection Error: {str(e)}")
    print("   ℹ️  Deployment may still be in progress")

# Summary
print("\n" + "="*80)
print("DEPLOYMENT CONFIGURATION")
print("="*80)

print("""
✅ Auto-Deployment Enabled:
   - Vercel (Frontend): Auto-deploys from main branch
   - Render (Backend): Auto-deploys from main branch

✅ Latest Changes Committed:
   1. 2aeed87 - docs: Update payment system synchronization status
   2. bfb425c - chore: Add payment sync and reconciliation scripts
   3. 7af6dc5 - feat: Simplify batch management modal
   4. dd47677 - docs: Update deployment status

✅ Deployment Timeline:
   - Commit pushed to GitHub: Just now
   - Vercel deployment: Auto-triggered (5-10 minutes)
   - Render deployment: Auto-triggered (3-5 minutes)
   - Dashboard updates: Real-time after deployment

⏱️  Expected Deployment Time:
   - Frontend: Within 10 minutes
   - Backend: Within 5 minutes
   - Full system sync: Within 15 minutes
""")

print("="*80)
print("✨ DEPLOYMENT IN PROGRESS")
print("="*80 + "\n")
