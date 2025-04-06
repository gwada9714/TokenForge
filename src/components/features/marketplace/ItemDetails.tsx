import { Box, Typography } from "@mui/material";

const ItemDetails = () => {
  return (
    <Box>
      <Typography variant="h4" style={{ color: "#182038" }}>
        Item Details
      </Typography>
      <Typography variant="body1" style={{ color: "#666" }}>
        Detailed information about the selected item.
      </Typography>
    </Box>
  );
};

export default ItemDetails;
