import { useState } from "react";

export default function ReviewForm({ onSubmit }) {
  const [form, setForm] = useState({
    user_name: "",
    rating_faculty: 0,
    rating_placement: 0,
    rating_infra: 0,
    rating_hostel: 0,
    review_text: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };
   return (
    <form onSubmit={handleSubmit} className="review-form">
      <input name="user_name" placeholder="Your name" onChange={handleChange} />

      <input name="rating_faculty" type="number" placeholder="Faculty rating" onChange={handleChange} />

      <input name="rating_placement" type="number" placeholder="Placement rating" onChange={handleChange} />

      <input name="rating_infra" type="number" placeholder="Infra rating" onChange={handleChange} />

      <input name="rating_hostel" type="number" placeholder="Hostel rating" onChange={handleChange} />

      <textarea name="review_text" placeholder="Write review" onChange={handleChange} />

      <button type="submit">Submit</button>
    </form>
  );
}
