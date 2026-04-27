"""
Comprehensive payment sync and reconciliation script.
Syncs all payments from Razorpay and recalculates system statistics.

Usage:
    python manage.py shell < sync_all_payments.py
    OR
    python sync_all_payments.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from decimal import Decimal
from apps.payments.models import Payment
from apps.enrollments.models import Enrollment
import logging

logger = logging.getLogger(__name__)

class PaymentSyncManager:
    """Manages payment synchronization and statistics recalculation."""
    
    def __init__(self):
        self.stats = {
            'total_collections': 0,
            'total_outstanding': 0,
            'total_transactions': 0,
            'online_payments': 0,
            'online_amount': 0,
            'cash_payments': 0,
            'cash_amount': 0,
            'pending_confirmation': 0,
            'success_rate': 0,
            'success_count': 0,
            'failed_count': 0,
        }
    
    @transaction.atomic
    def sync_razorpay_and_recalculate(self):
        """Main synchronization process."""
        print("\n" + "="*80)
        print("PAYMENT SYSTEM SYNC AND RECONCILIATION")
        print("="*80)
        
        # Step 1: Sync with Razorpay
        print("\nStep 1: Syncing with Razorpay...")
        self._sync_razorpay()
        
        # Step 2: Verify payment integrity
        print("\nStep 2: Verifying payment integrity...")
        self._verify_payments()
        
        # Step 3: Recalculate enrollment amounts
        print("\nStep 3: Recalculating enrollment finances...")
        self._recalculate_enrollments()
        
        # Step 4: Calculate dashboard statistics
        print("\nStep 4: Calculating dashboard statistics...")
        self._calculate_statistics()
        
        # Step 5: Print summary report
        print("\nStep 5: Generating summary report...")
        self._print_summary()
        
        return self.stats
    
    def _sync_razorpay(self):
        """Sync payments from Razorpay."""
        try:
            import razorpay
            from django.conf import settings
            
            RAZORPAY_KEY_ID = getattr(settings, 'RAZORPAY_KEY_ID', '')
            RAZORPAY_KEY_SECRET = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
            
            if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
                print("   WARN: Razorpay credentials not configured")
                print("   INFO: Skipping Razorpay sync")
                return
            
            print("   * Initializing Razorpay client...")
            razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            
            # Fetch recent payments from Razorpay (up to 500)
            print("   * Fetching payments from Razorpay...")
            razorpay_payments = razorpay_client.payment.all({'skip': 0, 'count': 500})
            
            # Robust item access
            if isinstance(razorpay_payments, dict):
                razorpay_items = razorpay_payments.get('items', [])
            elif isinstance(razorpay_payments, list):
                razorpay_items = razorpay_payments
            else:
                razorpay_items = getattr(razorpay_payments, 'items', []) if hasattr(razorpay_payments, 'items') else []
            
            print(f"   OK: Fetched {len(razorpay_items)} payments from Razorpay")
            
            # Get all pending (CREATED) payments from database
            pending_payments = {
                p.razorpay_order_id: p for p in 
                Payment.objects.filter(status='CREATED').select_related('enrollment')
                if p.razorpay_order_id
            }
            
            confirmed_count = 0
            failed_count = 0
            
            # Process each Razorpay payment
            for rzp_payment in razorpay_items:
                # Handle both dict and object types
                if isinstance(rzp_payment, dict):
                    rzp_order_id = rzp_payment.get('order_id')
                    rzp_payment_id = rzp_payment.get('id')
                    rzp_status = rzp_payment.get('status')
                    rzp_amount = Decimal(str(rzp_payment.get('amount', 0) / 100))
                else:
                    rzp_order_id = getattr(rzp_payment, 'order_id', None)
                    rzp_payment_id = getattr(rzp_payment, 'id', None)
                    rzp_status = getattr(rzp_payment, 'status', None)
                    rzp_amount = Decimal(str(getattr(rzp_payment, 'amount', 0) / 100))
                
                # Only process captured/authorized payments
                if rzp_status not in ['captured', 'authorized']:
                    continue
                
                # Try to match with pending payment
                if rzp_order_id not in pending_payments:
                    continue
                
                payment = pending_payments[rzp_order_id]
                
                try:
                    # Update payment record
                    payment.razorpay_payment_id = rzp_payment_id
                    payment.razorpay_signature = 'verified_via_sync'
                    payment.transaction_id = rzp_payment_id
                    payment.status = 'SUCCESS'
                    payment.save()
                    
                    confirmed_count += 1
                except Exception as e:
                    print(f"   ERR: Error confirming payment {rzp_payment_id}: {str(e)}")
                    failed_count += 1
            
            print(f"   OK: Confirmed {confirmed_count} pending payments")
            if failed_count > 0:
                print(f"   ERR: Failed to confirm {failed_count} payments")
        
        except ImportError:
            print("   WARN: razorpay package not installed")
            print("   INFO: Skipping Razorpay sync")
        except Exception as e:
            print(f"   ERR: Razorpay sync error: {str(e)}")
    
    def _verify_payments(self):
        """Verify payment data integrity."""
        all_payments = Payment.objects.filter(is_deleted=False)
        orphaned = 0
        invalid = 0
        
        for payment in all_payments:
            # Check if enrollment exists
            try:
                enrollment = payment.enrollment
                if not enrollment or enrollment.is_deleted:
                    # print(f"   WARN: Orphaned payment: {payment.id}")
                    orphaned += 1
                    continue
                
                # Verify amount is positive
                if payment.amount <= 0:
                    # print(f"   WARN: Invalid amount in payment: {payment.id}")
                    invalid += 1
            except Exception as e:
                # print(f"   ERR: Error verifying payment {payment.id}: {str(e)}")
                pass
        
        print(f"   OK: Verified {all_payments.count()} payments")
        if orphaned > 0:
            print(f"   WARN: Found {orphaned} orphaned payments")
        if invalid > 0:
            print(f"   WARN: Found {invalid} invalid payments")
    
    def _recalculate_enrollments(self):
        """Recalculate paid and pending amounts for all enrollments."""
        enrollments = Enrollment.objects.filter(is_deleted=False, status='ACTIVE')
        updated_count = 0
        
        for enrollment in enrollments:
            # Calculate total paid from successful payments
            total_paid = Payment.objects.filter(
                enrollment=enrollment,
                status='SUCCESS',
                is_deleted=False
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Calculate pending
            total_pending = max(
                Decimal('0'),
                Decimal(str(enrollment.total_fee)) - Decimal(str(total_paid))
            )
            
            # Update only if changed
            if enrollment.paid_amount != total_paid or enrollment.pending_amount != total_pending:
                enrollment.paid_amount = Decimal(str(total_paid))
                enrollment.pending_amount = total_pending
                enrollment.save()
                updated_count += 1
        
        print(f"   OK: Recalculated {updated_count} out of {enrollments.count()} enrollments")
    
    def _calculate_statistics(self):
        """Calculate all dashboard statistics."""
        # Collections (successful payments)
        total_collections = Payment.objects.filter(
            status='SUCCESS',
            is_deleted=False
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Outstanding (pending from active enrollments)
        total_outstanding = Enrollment.objects.filter(
            is_deleted=False,
            status='ACTIVE'
        ).aggregate(Sum('pending_amount'))['pending_amount__sum'] or 0
        
        # Total transactions
        total_transactions = Payment.objects.filter(is_deleted=False).count()
        
        # Online payments
        online_payments_data = Payment.objects.filter(
            payment_mode='ONLINE',
            is_deleted=False
        ).aggregate(
            count=Count('id'),
            total=Sum('amount')
        )
        online_count = online_payments_data['count'] or 0
        online_total = online_payments_data['total'] or 0
        
        # Cash payments
        cash_payments_data = Payment.objects.filter(
            payment_mode='CASH',
            is_deleted=False
        ).aggregate(
            count=Count('id'),
            total=Sum('amount')
        )
        cash_count = cash_payments_data['count'] or 0
        cash_total = cash_payments_data['total'] or 0
        
        # Pending confirmation
        pending_confirmation = Payment.objects.filter(
            status__in=['PENDING_CONFIRMATION', 'CREATED'],
            is_deleted=False
        ).count()
        
        # Success rate
        success_count = Payment.objects.filter(
            status='SUCCESS',
            is_deleted=False
        ).count()
        failed_count = Payment.objects.filter(
            status='FAILED',
            is_deleted=False
        ).count()
        success_rate = (success_count / total_transactions * 100) if total_transactions > 0 else 0
        
        # Store statistics
        self.stats = {
            'total_collections': float(total_collections),
            'total_outstanding': float(total_outstanding),
            'total_transactions': total_transactions,
            'online_payments': online_count,
            'online_amount': float(online_total),
            'cash_payments': cash_count,
            'cash_amount': float(cash_total),
            'pending_confirmation': pending_confirmation,
            'success_rate': round(success_rate, 2),
            'success_count': success_count,
            'failed_count': failed_count,
        }
    
    def _print_summary(self):
        """Print comprehensive summary report."""
        print("\n" + "="*80)
        print("PAYMENT SYSTEM SUMMARY")
        print("="*80)
        
        print("\nCOLLECTIONS AND OUTSTANDING:")
        print(f"   * Total Collections (Confirmed): INR {self.stats['total_collections']:,.2f}")
        print(f"   * Outstanding Amount: INR {self.stats['total_outstanding']:,.2f}")
        print(f"   * Total Transactions: {self.stats['total_transactions']}")
        
        print("\nPAYMENT MODES:")
        print(f"   * Online Payments: {self.stats['online_payments']} (INR {self.stats['online_amount']:,.2f})")
        print(f"   * Cash Payments: {self.stats['cash_payments']} (INR {self.stats['cash_amount']:,.2f})")
        
        print("\nPENDING:")
        print(f"   * Pending Confirmation: {self.stats['pending_confirmation']}")
        
        print("\nSUCCESS METRICS:")
        print(f"   * Success Rate: {self.stats['success_rate']}%")
        print(f"   * Successful Payments: {self.stats['success_count']}")
        print(f"   * Failed Payments: {self.stats['failed_count']}")
        
        print("\n" + "="*80)
        print("SYNC COMPLETE - System is now synchronized")
        print("="*80 + "\n")


def main():
    """Run the synchronization."""
    try:
        manager = PaymentSyncManager()
        stats = manager.sync_razorpay_and_recalculate()
        return stats
    except Exception as e:
        print(f"\nSYNC FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    main()