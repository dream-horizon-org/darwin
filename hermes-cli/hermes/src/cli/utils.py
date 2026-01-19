from typing import Dict, Any


def print_hermes_response(response: Dict[str, Any]) -> None:
    """Print API response in a formatted way"""
    try:
        if not response:
            return
        # Print status and message
        print("\n=== Response Summary ===")
        print(f"Status: {response.get('status', 'N/A')}")
        print(f"Message: {response.get('message', 'N/A')}")
        print(f"Data: {response.get('data','N/A')}")

        # Print data details if available
        if "data" in response:
            print("\n=== Response Details ===")
            data = response["data"]

            # Print timestamps if available
            for time_field in ["created_at", "updated_at"]:
                if time_field in data:
                    print(f"{time_field.replace('_', ' ').title()}: {data[time_field]}")

            # Print IDs if available
            for id_field in [
                "id",
                "serve_id",
                "created_by_id",
                "updated_by_id",
                "environment_id",
            ]:
                if id_field in data:
                    print(f"{id_field.replace('_', ' ').title()}: {data[id_field]}")

            # Print FastAPI config if available
            if "fast_api_config" in data:
                print("\nFastAPI Configuration:")
                for key, value in data["fast_api_config"].items():
                    print(f"  {key.replace('_', ' ').title()}: {value}")

            # Print other relevant fields
            for key, value in data.items():
                if key not in [
                    "created_at",
                    "updated_at",
                    "fast_api_config",
                ] and not key.endswith("_id"):
                    print(f"{key.replace('_', ' ').title()}: {value}")

        print("\n" + "=" * 25)

    except Exception as e:
        print(f"Error printing response: {str(e)}")
