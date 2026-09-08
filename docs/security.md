# Security

The V1 client has no API keys, accounts, analytics or network calls. SQLite writes use bind parameters. Input is validated before persistence; errors do not expose SQL or stack traces. Never commit local databases, keystores, `.env` files or build artifacts.
