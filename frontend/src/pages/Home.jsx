  import React, { useEffect, useState, useRef } from "react";
  import { useLocation } from "react-router-dom";
  import API from "../services/api";
  import CollegeCard from "../components/CollegeCard";
  import Skeleton from "../components/Skeleton";

  export default function Home() {

    const location = useLocation();

    const [colleges, setColleges] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [history, setHistory] = useState([]);

    const [hasSearched, setHasSearched] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const debounceRef = useRef(null);
    const dropdownRef = useRef(null);


    /* =====================================================
      LOAD SEARCH HISTORY
    ===================================================== */
    useEffect(() => {

      const saved = localStorage.getItem("searchHistory");

      if (saved) {
        setHistory(JSON.parse(saved));
      }

    }, []);


    /* =====================================================
      SAVE SEARCH HISTORY
    ===================================================== */
    const saveSearchHistory = (term) => {

      if (!term.trim()) return;

      let newHistory = history.filter(item => item !== term);

      newHistory.unshift(term);

      if (newHistory.length > 6) {
        newHistory = newHistory.slice(0, 6);
      }

      setHistory(newHistory);

      localStorage.setItem(
        "searchHistory",
        JSON.stringify(newHistory)
      );

    };


    /* =====================================================
      REMOVE HISTORY ITEM
    ===================================================== */
    const removeHistory = (term) => {

      const newHistory = history.filter(item => item !== term);

      setHistory(newHistory);

      localStorage.setItem(
        "searchHistory",
        JSON.stringify(newHistory)
      );

    };


    /* =====================================================
      FETCH COLLEGES
    ===================================================== */
    const fetchColleges = async (search = "") => {

      try {

        setLoading(true);

        const res = await API.get(
          `/colleges?search=${encodeURIComponent(search)}`
        );

        setColleges(res.data);

      } catch (err) {

        console.error(err);

        setError("Failed to load colleges");

      } finally {

        setLoading(false);

      }

    };


    /* =====================================================
      AUTO SEARCH FROM URL
    ===================================================== */
    useEffect(() => {

      const params = new URLSearchParams(location.search);

      const search = params.get("search");

      if (search) {

        setSearchTerm(search);

        fetchColleges(search);

        setHasSearched(true);

      }

    }, [location.search]);


    /* =====================================================
      AUTO SEARCH WITH DEBOUNCE
    ===================================================== */
    useEffect(() => {

      if (!searchTerm.trim()) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {

        fetchColleges(searchTerm);

        setHasSearched(true);

      }, 500);

      return () => clearTimeout(debounceRef.current);

    }, [searchTerm]);


    /* =====================================================
      SEARCH BUTTON CLICK
    ===================================================== */
    const handleSearch = () => {

      if (!searchTerm.trim()) return;

      fetchColleges(searchTerm);

      setHasSearched(true);

      saveSearchHistory(searchTerm);

      setShowDropdown(false);

      window.history.pushState(
        {},
        "",
        `?search=${encodeURIComponent(searchTerm)}`
      );

    };


    /* =====================================================
      CLICK HISTORY ITEM
    ===================================================== */
    const handleHistoryClick = (term) => {

      setSearchTerm(term);

      fetchColleges(term);

      setHasSearched(true);

      saveSearchHistory(term);

      setShowDropdown(false);

      window.history.pushState(
        {},
        "",
        `?search=${encodeURIComponent(term)}`
      );

    };


    /* =====================================================
      ENTER KEY SUPPORT
    ===================================================== */
    const handleKeyDown = (e) => {

      if (e.key === "Enter") {
        handleSearch();
      }

    };


    /* =====================================================
      CLOSE DROPDOWN OUTSIDE CLICK
    ===================================================== */
    useEffect(() => {

      const handleClickOutside = (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setShowDropdown(false);
        }

      };

      document.addEventListener("mousedown", handleClickOutside);

      return () =>
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );

    }, []);


    /* =====================================================
      ERROR STATE
    ===================================================== */
    if (error) {

      return (
        <div style={{ padding: "40px", color: "red" }}>
          {error}
        </div>
      );

    }



    
    return (

      <div>

        {/* HERO */}
        <div className="hero">
          <div className="hero-overlay">

            <h1>Find Your Perfect College</h1>

            <div
              className="search-container"
              ref={dropdownRef}
              style={{
                position: "relative",
                maxWidth: "500px",
                margin: "0 auto"
              }}
            >

              <input
                className="search-box"
                placeholder="Search colleges or location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowDropdown(true)}
              />

              <button
                className="search-btn"
                onClick={handleSearch}
              >
                Search
              </button>


              {/* DROPDOWN */}
              {showDropdown && history.length > 0 && (

                <div className="search-dropdown">

                  {history.map((item, index) => (

                    <div
                      key={index}
                      className="search-dropdown-item"
                      onClick={() => handleHistoryClick(item)}
                      onMouseDown={(e) => e.preventDefault()}
                    >

                      <span className="search-icon">🔍</span>

                      <span className="search-text">
                        {item}
                      </span>

                      <span
                        className="search-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistory(item);
                        }}
                      >
                        ×
                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>
        </div>


        {/* RESULTS COUNT */}
        <div style={{ padding: "0 40px" }}>

          {loading && hasSearched && (
            <p>Searching colleges...</p>
          )}

          {hasSearched && !loading && (
            <p>{colleges.length} colleges found</p>
          )}

        </div>


        {/* GRID */}
        <div className="grid">

          {loading && hasSearched && (

            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))

          )}

          {!loading && hasSearched && colleges.length === 0 && (

            <p style={{ padding: "40px" }}>
              No colleges found
            </p>

          )}

          {!loading && hasSearched && colleges.map(college => (

            <CollegeCard
              key={college._id}
              college={college}
            />

          ))}

        </div>

      </div>

    );

  }