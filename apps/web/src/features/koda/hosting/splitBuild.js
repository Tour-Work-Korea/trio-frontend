// A stable loader lets the shared SPA fallback load the current KODA release
// without rebuilding its root index.html on every KODA-only deployment.
export function kodaRuntimePlugin(runtimePath) {
  return {
    name: 'koda-runtime-loader',
    enforce: 'post',
    generateBundle(_, bundle) {
      const entry = Object.values(bundle).find(
        item =>
          item.type === 'chunk' &&
          item.isEntry &&
          item.facadeModuleId === runtimePath,
      );
      if (!entry) throw new Error('Missing KODA runtime entry.');
      const css = new Set();
      const visited = new Set();
      function visit(chunk) {
        if (!chunk || visited.has(chunk.fileName)) return;
        visited.add(chunk.fileName);
        for (const file of chunk.viteMetadata?.importedCss || [])
          css.add(`/${file}`);
        for (const file of chunk.imports || []) visit(bundle[file]);
      }
      visit(entry);
      if (!css.size) throw new Error('Missing KODA runtime styles.');
      this.emitFile({
        type: 'asset',
        fileName: 'koda/entry.js',
        source: `await Promise.all(${JSON.stringify([
          ...css,
        ])}.map(href => new Promise((resolve, reject) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = href; link.onload = resolve; link.onerror = reject;
  document.head.append(link);
})));
await import(${JSON.stringify(`/${entry.fileName}`)});
`,
      });
    },
  };
}
