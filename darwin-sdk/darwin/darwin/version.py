from darwin.exceptions import UnsupportedSparkVersionError


class Version:
    """
    Represents a version of Spark in the format major.minor.patch.
    """

    major: int
    minor: int
    patch: int

    SUPPORTED_SPARK_VERSIONS = ["3.5.0"]

    def __init__(self, version: str):
        self.major, self.minor, self.patch = map(int, version.split("."))
        self.validate_spark_version()

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

    def __repr__(self):
        return f"Version({self.major}.{self.minor}.{self.patch})"

    def __eq__(self, other):
        return (self.major, self.minor, self.patch) == (
            other.major,
            other.minor,
            other.patch,
        )

    def __lt__(self, other):
        return (self.major, self.minor, self.patch) < (
            other.major,
            other.minor,
            other.patch,
        )

    def __gt__(self, other):
        return (self.major, self.minor, self.patch) > (
            other.major,
            other.minor,
            other.patch,
        )

    def __le__(self, other):
        return self < other or self == other

    def __ge__(self, other):
        return self > other or self == other

    def validate_spark_version(self):
        if self.__str__() not in self.SUPPORTED_SPARK_VERSIONS:
            raise UnsupportedSparkVersionError(f"Spark version {self.__str__()} is not supported")
        return True
