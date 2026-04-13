(async () => {
  try {
    await import('./server/src/server.js');
  } catch (error) {
    console.error('[Passenger bootstrap failed]', error);
    process.exit(1);
  }
})();
