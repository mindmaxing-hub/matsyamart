import QRCode from "qrcode";

export async function generateQrDataUrl(
  text: string,
  darkColor: string = "#1F0B07",
): Promise<string> {
  if (!text) return "";
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: darkColor,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: text.length > 800 ? "L" : "M",
    });
  } catch (err) {
    console.warn("Failed standard QR generation, attempting fallback with low ECC", err);
    try {
      return await QRCode.toDataURL(text, {
        width: 280,
        margin: 2,
        color: {
          dark: darkColor,
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "L",
      });
    } catch (fallbackErr) {
      console.error("Critical failure generating QR code", fallbackErr);
      return "";
    }
  }
}
