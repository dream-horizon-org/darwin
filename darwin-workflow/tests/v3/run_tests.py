#!/usr/bin/env python3
"""
Test runner script for V3 workflow tests
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path


def setup_test_environment():
    """Setup test environment variables"""
    os.environ["TESTING"] = "true"
    os.environ["ENVIRONMENT"] = "test"
    os.environ["LOG_LEVEL"] = "DEBUG"


def run_unit_tests():
    """Run unit tests for V3 modules"""
    print("Running V3 Unit Tests...")
    
    # Model layer tests
    print("\n--- Model Layer Tests ---")
    result = subprocess.run([
        "python", "-m", "pytest", 
        "model/tests/v3/", 
        "-v", 
        "--tb=short"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Model tests failed:")
        print(result.stdout)
        print(result.stderr)
        return False
    else:
        print("Model tests passed!")
    
    # Core layer tests
    print("\n--- Core Layer Tests ---")
    result = subprocess.run([
        "python", "-m", "pytest", 
        "core/tests/v3/", 
        "-v", 
        "--tb=short"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Core tests failed:")
        print(result.stdout)
        print(result.stderr)
        return False
    else:
        print("Core tests passed!")
    
    return True


def run_api_tests():
    """Run API tests for V3 endpoints"""
    print("\n--- API Layer Tests ---")
    
    result = subprocess.run([
        "python", "-m", "pytest", 
        "app_layer/tests/v3/", 
        "-v", 
        "--tb=short"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("API tests failed:")
        print(result.stdout)
        print(result.stderr)
        return False
    else:
        print("API tests passed!")
    
    return True


def run_airflow_tests():
    """Run Airflow integration tests"""
    print("\n--- Airflow Integration Tests ---")
    
    result = subprocess.run([
        "python", "-m", "pytest", 
        "airflow/tests/v3/", 
        "-v", 
        "--tb=short"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Airflow tests failed:")
        print(result.stdout)
        print(result.stderr)
        return False
    else:
        print("Airflow tests passed!")
    
    return True


def run_integration_tests():
    """Run integration tests"""
    print("\n--- Integration Tests ---")
    
    result = subprocess.run([
        "python", "-m", "pytest", 
        "tests/v3/test_integration.py", 
        "-v", 
        "--tb=short"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Integration tests failed:")
        print(result.stdout)
        print(result.stderr)
        return False
    else:
        print("Integration tests passed!")
    
    return True


def run_all_tests():
    """Run all V3 tests"""
    print("Running All V3 Tests...")
    print("=" * 50)
    
    setup_test_environment()
    
    all_passed = True
    
    # Run unit tests
    if not run_unit_tests():
        all_passed = False
    
    # Run API tests
    if not run_api_tests():
        all_passed = False
    
    # Run Airflow tests
    if not run_airflow_tests():
        all_passed = False
    
    # Run integration tests
    if not run_integration_tests():
        all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ All V3 tests passed!")
        return 0
    else:
        print("❌ Some V3 tests failed!")
        return 1


def run_specific_test(test_path):
    """Run a specific test file or test function"""
    print(f"Running specific test: {test_path}")
    
    setup_test_environment()
    
    result = subprocess.run([
        "python", "-m", "pytest", 
        test_path, 
        "-v", 
        "--tb=short"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Test failed:")
        print(result.stdout)
        print(result.stderr)
        return 1
    else:
        print("Test passed!")
        return 0


def run_tests_with_coverage():
    """Run tests with coverage report"""
    print("Running V3 Tests with Coverage...")
    
    setup_test_environment()
    
    result = subprocess.run([
        "python", "-m", "pytest", 
        "model/tests/v3/",
        "core/tests/v3/",
        "app_layer/tests/v3/",
        "airflow/tests/v3/",
        "tests/v3/test_integration.py",
        "--cov=workflow_model.v3",
        "--cov=workflow_core.v3",
        "--cov=workflow_app_layer.v3",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "-v"
    ], capture_output=True, text=True)
    
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    return result.returncode


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Run V3 workflow tests")
    parser.add_argument(
        "--test", 
        type=str, 
        help="Run a specific test file or test function"
    )
    parser.add_argument(
        "--coverage", 
        action="store_true", 
        help="Run tests with coverage report"
    )
    parser.add_argument(
        "--unit-only", 
        action="store_true", 
        help="Run only unit tests"
    )
    parser.add_argument(
        "--api-only", 
        action="store_true", 
        help="Run only API tests"
    )
    parser.add_argument(
        "--airflow-only", 
        action="store_true", 
        help="Run only Airflow tests"
    )
    parser.add_argument(
        "--integration-only", 
        action="store_true", 
        help="Run only integration tests"
    )
    
    args = parser.parse_args()
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    if args.test:
        return run_specific_test(args.test)
    elif args.coverage:
        return run_tests_with_coverage()
    elif args.unit_only:
        setup_test_environment()
        return 0 if run_unit_tests() else 1
    elif args.api_only:
        setup_test_environment()
        return 0 if run_api_tests() else 1
    elif args.airflow_only:
        setup_test_environment()
        return 0 if run_airflow_tests() else 1
    elif args.integration_only:
        setup_test_environment()
        return 0 if run_integration_tests() else 1
    else:
        return run_all_tests()


if __name__ == "__main__":
    sys.exit(main()) 