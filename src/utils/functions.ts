function getElapsed(createdAt: string | Date, currentTime: Date = new Date()): string {
    const diffMs = Math.max(0, currentTime.getTime() - new Date(createdAt).getTime());

    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    // if (hours === 0) {
    //   return `${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // }

    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export { getElapsed };