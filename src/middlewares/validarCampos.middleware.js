export const validarSchema = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.reduce((acc, issue) => {
      const key = issue.path.join('.');
      acc[key] = acc[key] || [];
      const message = issue.code === 'invalid_type' && issue.input === undefined ? 'Campo obligatorio' : issue.message;
      acc[key].push(message);
      return acc;
    }, {});
    return res.status(400).json({ error: errors });
  }
  const targetKey = source === 'query' ? 'validatedQuery' : `validated${source.charAt(0).toUpperCase() + source.slice(1)}`;
  req[targetKey] = result.data;
  next();
};
