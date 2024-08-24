// pages/admin.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const [name, setName] = useState("");
  const [pricing, setPricing] = useState("");
  const [rating, setRating] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // New state for image URL
  const [googleLink, setGoogleLink] = useState(""); // New state for Google rating link

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (
      !name ||
      !pricing ||
      !rating ||
      !postalCode ||
      !imageUrl ||
      !googleLink
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (isNaN(pricing) || isNaN(rating)) {
      alert("Pricing and Rating must be numbers.");
      return;
    }

    try {
      await addDoc(collection(db, "laboratories"), {
        name,
        pricing: parseFloat(pricing),
        rating: parseFloat(rating),
        postalCode,
        imageUrl,
        googleLink,
      });

      // Clear inputs
      setName("");
      setPricing("");
      setRating("");
      setPostalCode("");
      setImageUrl(""); // Clear image URL
      setGoogleLink(""); // Clear Google link
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input
          type="text"
          placeholder="Laboratory Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Pricing"
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Google Rating Link"
          value={googleLink}
          onChange={(e) => setGoogleLink(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          Add Laboratory
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
