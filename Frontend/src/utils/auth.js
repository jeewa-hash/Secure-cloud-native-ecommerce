export const getToken = () => {
    return localStorage.getItem("token");
  };
  
  export const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });
  
  export const logoutUser = () => {
    localStorage.removeItem("token");
  };
  
  export const decodeTokenPayload = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };
  
  export const getCurrentUserRole = () => {
    const token = getToken();
    if (!token) return null;
  
    const decoded = decodeTokenPayload(token);
    return decoded?.user?.role || decoded?.role || null;
  };