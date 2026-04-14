export const getAuthToken = (reduxToken) => {
  if (reduxToken) return reduxToken;
  try {
    const parsed = JSON.parse(raw);
    return null;
  } catch {
    return null;
  }
};
