import pytest

from darwin.exceptions import UnsupportedSparkConfigError
from darwin.spark.config_manager.spark_config_assembler import SparkConfigAssembler


def test_merge_comma_strategy():
    default_conf = {"spark.files": "file1.py"}
    user_conf = {"spark.files": "file2.py"}
    merged = SparkConfigAssembler.merge_conf(user_conf, default_conf)
    assert merged["spark.files"] == "file1.py,file2.py"


def test_merge_colon_strategy():
    default_conf = {"spark.executor.extraClassPath": "/opt/lib"}
    user_conf = {"spark.executor.extraClassPath": "/custom/lib"}
    merged = SparkConfigAssembler.merge_conf(user_conf, default_conf)
    assert merged["spark.executor.extraClassPath"] == "/opt/lib:/custom/lib"


def test_merge_space_strategy():
    default_conf = {"spark.driver.extraJavaOptions": "-Xmx2g"}
    user_conf = {"spark.driver.extraJavaOptions": "-XX:+UseG1GC"}
    merged = SparkConfigAssembler.merge_conf(user_conf, default_conf)
    assert merged["spark.driver.extraJavaOptions"] == "-Xmx2g -XX:+UseG1GC"


def test_merge_fallback_to_overwrite():
    default_conf = {"spark.custom.setting": "default-value"}
    user_conf = {"spark.custom.setting": "new-value"}
    merged = SparkConfigAssembler.merge_conf(user_conf, default_conf)
    assert merged["spark.custom.setting"] == "new-value"


def test_skip_empty_user_value():
    default_conf = {"spark.files": "file1.py"}
    user_conf = {"spark.files": ""}
    merged = SparkConfigAssembler.merge_conf(user_conf, default_conf)
    assert merged["spark.files"] == "file1.py"  # default remains


def test_merge_empty_user_value():
    default_conf = {"spark.files": "file1.py"}
    user_conf = {}
    merged = SparkConfigAssembler.merge_conf(user_conf, default_conf)
    assert merged["spark.files"] == "file1.py"  # default remains


def test_unsupported_strategy_raises_exception():
    default_conf = {"spark.jars": "lib1.jar"}
    user_conf = {"spark.jars": "lib2.jar"}
    with pytest.raises(UnsupportedSparkConfigError):
        SparkConfigAssembler.merge_conf(user_conf, default_conf)


def test_static_class_cannot_be_instantiated():
    with pytest.raises(TypeError, match="is a static utility class and cannot be instantiated"):
        SparkConfigAssembler()
