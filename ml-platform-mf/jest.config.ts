module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/testBootstrap.ts'],
  testEnvironment: 'enzyme',
  testEnvironmentOptions: {
    enzymeAdapter: 'react16'
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
  transformIgnorePatterns: ['node_modules/(?!(react-redux|lodash-es)/)'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testRegex: '.*\\.test\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}
