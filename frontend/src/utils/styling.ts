export const difficultyToClass = (difficulty: string) => {
  return (
    {
      "Very Easy": "info",
      Easy: "success",
      Medium: "warning",
      Hard: "danger",
      "Very Hard": "dark",
    }[difficulty] ?? ""
  );
};
