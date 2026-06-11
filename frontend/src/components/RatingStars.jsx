export default function RatingStars({ rating }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i}>
        {i <= rating ? "★" : "☆"}
      </span>
    );
  }

  return <div className="stars">{stars}</div>;
}
