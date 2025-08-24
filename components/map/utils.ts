// Utility: Convert decimal degrees to DMS string
export function toDMS(deg: number, isLat: boolean) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = isLat
    ? deg >= 0 ? "N" : "S"
    : deg >= 0 ? "E" : "W";
  return `${degrees}°${minutes}'${seconds}"${direction}`;
} 