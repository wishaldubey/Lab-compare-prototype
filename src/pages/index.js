import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaSliders, FaArrowLeft } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

// city component
const cities = [
  { name: "Mumbai", pincode: "400001", imageUrl: "/mumbai.webp" },
  { name: "Pune", pincode: "411001", imageUrl: "/pune.webp" },
  { name: "Nashik", pincode: "422001", imageUrl: "/nashik.webp" },
  { name: "Delhi", pincode: "110001", imageUrl: "/delhi.webp" },
  { name: "Noida", pincode: "201301", imageUrl: "/noida.webp" },
  { name: "Faridabad", pincode: "121101", imageUrl: "/faridabad.webp" },
  { name: "Gurugram", pincode: "122001", imageUrl: "/gurugram.webp" },
  { name: "Chandigarh", pincode: "160001", imageUrl: "/chandigarh.webp" },
  { name: "Ghaziabad", pincode: "201001", imageUrl: "/ghaziabad.webp" },
  { name: "Hyderabad", pincode: "500001", imageUrl: "/hyderabad.webp" },
  { name: "Bangalore", pincode: "560001", imageUrl: "/bengalore.webp" },
  { name: "Mysuru", pincode: "570001", imageUrl: "/mysuru.webp" },
  { name: "Chennai", pincode: "600001", imageUrl: "/chennai.webp" },
  { name: "Jaipur", pincode: "302001", imageUrl: "/jaipur.webp" },
];

// search city component
const SearchCities = ({ onSelectCity, currentLocation }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.pincode.includes(searchTerm)
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredCities.length > 0) {
      onSelectCity(filteredCities[0]);
    }
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Search Labs</h1>
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Search by City Name or Pincode"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border p-2 rounded-full w-full text-black pl-3 pr-10"
        />
<FaSearch className="absolute top-1/2 transform -translate-y-1/2 right-3 h-5 w-5" style={{ color: '#156B86' }} />
      </div>
      {currentLocation && (
        <p className="text-white mb-4">Current Location: {currentLocation}</p>
      )}
      {filteredCities.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredCities.map((city) => (
            <div
              key={city.pincode}
              className="flex flex-col items-center cursor-pointer rounded-md overflow-hidden"
              onClick={() => onSelectCity(city)}
            >
              <img
                src={city.imageUrl}
                alt={city.name}
                className="h-24 w-24 object-cover"
              />
              <div className="w-full text-center text-sm text-white mt-2">
                <h2 className="font-bold">{city.name}</h2>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">We are currently unavailable here.</p>
      )}
    </div>
  );
};

// result component
const Home = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [labs, setLabs] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [currentLocation, setCurrentLocation] = useState("");

  const handleSelectCity = async (city) => {
    setSelectedCity(city);
    setLoading(true);

    const q = query(
      collection(db, "laboratories"),
      where("postalCode", "==", city.pincode)
    );
    const querySnapshot = await getDocs(q);
    const labData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLabs(labData);
    setNoResults(labData.length === 0);
    setLoading(false);
  };

  useEffect(() => {
    const fetchLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en&key=bdc_bda8a43075bf48138a6b1ca315d4dedf`
            );
            setCurrentLocation(response.data.locality || response.data.city || "Unknown Location");
          } catch (error) {
            console.error("Error fetching location data:", error);
          }
        });
      }
    };

    fetchLocation();
  }, []);

  // filter component
  const sortLabs = (labs) => {
    switch (sortOption) {
      case "priceLowToHigh":
        return [...labs].sort((a, b) => a.pricing - b.pricing);
      case "priceHighToLow":
        return [...labs].sort((a, b) => b.pricing - a.pricing);
      case "ratingLowToHigh":
        return [...labs].sort((a, b) => a.rating - b.rating);
      case "ratingHighToLow":
        return [...labs].sort((a, b) => b.rating - a.rating);
      default:
        return labs;
    }
  };

  const sortedLabs = sortLabs(labs);

  return (
    <div>
      {!selectedCity ? (
        <SearchCities onSelectCity={handleSelectCity} currentLocation={currentLocation} />
      ) : (
        <div className="container mx-auto p-5">
          <h1 className="text-2xl font-bold mb-5">
            Laboratories in {selectedCity.name}
          </h1>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedCity(null)}
              className="flex items-center text-white p-2 rounded"
              style={{ backgroundColor: '#156B86' }}
                          >
              <FaArrowLeft className="mr-2" /> {/* Back icon */}
              Back
            </button>
            {labs.length > 0 && (
              <div className="flex items-center">
                <FaSliders className="text-white mr-2" />
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border p-2 rounded bg-white text-black"
                >
                  <option value="default">Select</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                  <option value="ratingLowToHigh">Rating: Low to High</option>
                  <option value="ratingHighToLow">Rating: High to Low</option>
                </select>
              </div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full">
                <p className="text-white">Loading data...</p>
              </div>
            ) : sortedLabs.length > 0 ? (
              sortedLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="border p-3 mb-2 flex flex-col items-center"
                >
                  {lab.imageUrl && (
                    <img
                      src={lab.imageUrl}
                      alt={lab.name}
                      className="h-32 w-32 object-cover mb-2"
                    />
                  )}
                  <h2 className="font-bold">{lab.name}</h2>
                  <p>Pricing: ₹{lab.pricing}</p>
                  <p>Rating: {lab.rating}</p>
                  {lab.googleLink && (
                    <a
                      href={lab.googleLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 underline"
                    > 
                      View on Google 
                    </a>
                  )}
                </div>
              ))
            ) : noResults ? (
              <p className="text-white">We are currently unavailable here.</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
