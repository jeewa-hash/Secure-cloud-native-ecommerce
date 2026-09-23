export const getAllowedNextStatuses = (currentStatus) => {
    const flow = {
      pending: ["accepted", "declined"],
      accepted: ["preparing", "declined"],
      preparing: ["ready"],
      ready: ["picked-up"],
      "picked-up": ["delivered"],
      delivered: ["completed"],
      completed: [],
      declined: [],
    };
  
    return flow[currentStatus] || [];
  };