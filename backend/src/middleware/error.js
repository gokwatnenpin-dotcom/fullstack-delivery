export function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

export function errorHandler(error, req, res, _next) {
  console.error(error);
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: error.issues });
  if (error.code === '23505') return res.status(409).json({ error: 'A record with those details already exists' });
  res.status(500).json({ error: 'Internal server error' });
}
