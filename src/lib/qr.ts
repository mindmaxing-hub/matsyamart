import QRCode from "qrcode";

export async function generateQrDataUrl(
  text: string,
  darkColor: string = "#1F0B07",
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: darkColor,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Failed to generate QR code", err);
    return "";
  }
}
