# GitHub Copilot Instructions for Template Project

## Project Overview

This project is an inventory management system for a certain project about inventory management. It processes messages from SQS queues, calculates inventory policies, and generates reports based on different models and algorithms.

## Language Guidelines

- **Write all code, comments, and documentation in English**
- Existing function names, variables, and files may be in Portuguese, but any new additions should use English naming conventions
- When modifying existing Portuguese-named functions, maintain their original names for consistency

## Architecture

- The project follows a message-driven architecture using AWS SQS
- `read_messages.py` is the entry point that listens to SQS messages and routes them to appropriate handler functions
- Data is stored and retrieved from MongoDB and AWS S3
- Different inventory models are implemented in the `models/` directory
- Reports are generated using functions in the `reports/` directory

## Key Patterns

- Most modules follow a pattern where the main functionality is exposed through a `main()` function
- Configuration values are loaded from environment variables using `config.py`
- Logging is done using the centralized `setup_logger()` function from `logger_config.py`
- Error tracking is implemented using Sentry
- The main message processing loop in `read_messages.py` dispatches work based on message type and material type

## Message Processing Flow

1. Messages are received from SQS queue and parsed as JSON
2. The `on_message()` function routes the message to the appropriate handler based on message type
3. Specialized functions process different message types (e.g., policy calculations, parameter updates)
4. The results are stored or returned according to the specific operation

## Key File References

- `main.py`: Main entry point for message processing
- `config.py`: Central env vars management
- `logger_config.py`: Logging configuration
- `models/*.py`: Different inventory forecasting models
- `reports/*.py`: Report generation functions

## Testing & Deployment

- Docker is used for containerization (see `Dockerfile` and scripts in `scripts/`)
- Deployment scripts are located in the `scripts/` directory
- AWS credentials and other secrets are loaded from environment variables

## Common Practices

- Use dictionary-based dispatch for message routing instead of complex if-else chains
- Prefer collection operations (e.g., `in` operator with lists) over multiple conditions
- Follow standard Python naming conventions (snake_case for functions and variables)
- Use environment variables for configuration
- Implement proper error handling and logging

## Additional Resources

- AWS S3 file operations: see `functions/aws_s3_file.py`
- Auxiliary functions: see `functions/funcoes_auxiliares.py`
