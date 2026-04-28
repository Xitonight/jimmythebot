// .husky/install.mjs
// Skip Husky install in production or CI environments
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
    process.exit(0)
}

try {
    const { default: husky } = await import('husky')
    console.log(husky())
} catch {
    // If husky isn't installed (like in your 'deps' stage), just exit gracefully
    process.exit(0)
}
