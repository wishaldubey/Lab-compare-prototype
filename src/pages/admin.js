import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AdminDashboard = () => {
  const [name, setName] = useState("");
  const [pricing, setPricing] = useState("");
  const [rating, setRating] = useState(0);
  const [postalCode, setPostalCode] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [googleLink, setGoogleLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!name || !pricing || !postalCode || !imageFile || !googleLink) {
      alert("Please fill in all fields.");
      return;
    }

    if (isNaN(pricing)) {
      alert("Pricing must be a number.");
      return;
    }

    setLoading(true);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${imageFile.name}`);

      // Upload the image
      const snapshot = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Add the lab data to Firestore
      await addDoc(collection(db, "laboratories"), {
        name,
        pricing: parseFloat(pricing),
        rating,
        postalCode,
        imageUrl,
        googleLink,
      });

      // Clear inputs
      setName("");
      setPricing("");
      setRating(0);
      setPostalCode("");
      setImageFile(null);
      setGoogleLink("");
      document.getElementById("fileInput").value = null; // Clear file input field
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    setLoading(false);
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
          placeholder="Pricing (₹)"
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white w-full"
        />
        <div className="flex flex-col">
          <label htmlFor="rating" className="mb-1 text-white">
            Rating: {rating}
          </label>
          <input
            type="range"
            id="rating"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg  cursor-pointer"
          />
        </div>
        <input
          type="text"
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          className="border p-2 rounded text-black bg-white"
        />
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
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
          disabled={loading}
        >
          {loading ? "Uploading..." : "Add Laboratory"}
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;
