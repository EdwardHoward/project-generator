module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
    ],
    overrides: [
        {
            files: ['webpack.dev.js', 'webpack.prod.js'],
            rules: {
                'import/no-extraneous-dependencies': { devDependencies: true },
            },
        },
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        'react',
        '@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/no-use-before-define': ['error'],
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        indent: ['error', 4],
        'no-use-before-define': 'off',
        'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/prop-types': 'off',
    },
};
