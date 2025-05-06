export const generateSlug = (title: string): string => {
    return title
      .toLowerCase() // ubah ke huruf kecil
      .trim() // hilangkan spasi di awal/akhir
      .normalize("NFKD") // normalisasi unicode (untuk aksen dll)
      .replace(/[\u0300-\u036f]/g, "") // hapus aksen
      .replace(/[^a-z0-9\s-]/g, "") // hanya izinkan huruf, angka, spasi, -
      .replace(/\s+/g, "-") // ganti spasi dengan -
      .replace(/-+/g, "-"); // hilangkan tanda hubung berlebihan
  };
  