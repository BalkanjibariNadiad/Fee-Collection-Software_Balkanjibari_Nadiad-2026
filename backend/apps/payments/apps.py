from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.payments'

    def ready(self):
        import apps.payments.signals
        
        # Initialize APScheduler for payment syncing
        try:
            from apps.payments.scheduler import init_scheduler
        except ModuleNotFoundError as e:
            if e.name in {'apscheduler', 'apps.payments.scheduler'}:
                logger.debug('APScheduler is not installed; skipping scheduled payment sync.')
                return
            raise
        except ImportError as e:
            logger.debug('APScheduler import failed; skipping scheduled payment sync: %s', e)
            return

        try:
            init_scheduler()
        except Exception as e:
            logger.warning(f'Could not initialize APScheduler: {e}')
