module.exports = {
  devServer: {
    host: '0.0.0.0', // Escuchar en todas las interfaces de red
    port: 8080, // Puerto en el que se ejecutará tu aplicación (puedes cambiarlo si es necesario)
    proxy: {
      // Proxy para la API de RestDB
      '/api': {
        target: 'https://laboratorio3-5459.restdb.io/rest/',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
};