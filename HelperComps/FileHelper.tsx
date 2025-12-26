import { IMAGE_URL } from "../../../config";


export const getImageUrl =(thumbnailString: string | undefined) => {
    return thumbnailString
      ? `${IMAGE_URL}/uploads/${thumbnailString}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  }
