import structlog
import logging


def get_logger(name: str):
    logging.basicConfig(level=logging.INFO)
    return structlog.get_logger(name)
