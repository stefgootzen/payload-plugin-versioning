// module.exports = {
//   verbose: true,
//   testEnvironment: 'node',
//   transform: {
//     '^.+\\.(t|j)sx?$': '<rootDir>/node_modules/@swc/jest',
//   },
//   moduleNameMapper: {
//     '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
//       '<rootDir>/src/mocks/fileStub.js',
//     '\\.(css|scss)$': '<rootDir>/src/mocks/fileStub.js',
//   },
// }

module.exports = {
  testTimeout: 2000000,
  verbose: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/mocks/fileStub.js',
    '\\.(css|scss)$': '<rootDir>/src/mocks/fileStub.js',
  },
}
