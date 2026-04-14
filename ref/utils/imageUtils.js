export const getImageBaseUrl = (imageUrlArray = [], imageFor) => {
  return imageUrlArray.find((i) => i.image_for === imageFor)?.image_url || "";
};

export const getNoImageUrl = (imageUrlArray = []) => {
  return imageUrlArray.find((i) => i.image_for == "No Image")?.image_url || "";
};
