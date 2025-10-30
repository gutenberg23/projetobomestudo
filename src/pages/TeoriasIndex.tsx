import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TeoriasIndex = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main teorias page
    navigate("/teorias");
  }, [navigate]);

  return null;
};

export default TeoriasIndex;