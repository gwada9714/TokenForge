import { Box, Typography } from "@mui/material";

const ListItem = () => {
  return (
    <Box>
      <Typography variant="h6" style={{ color: "#182038" }}>
        Item Name
      </Typography>
      <Typography variant="body2" style={{ color: "#666" }}>
        Item description goes here.
      </Typography>
    </Box>
  );
};

export default ListItem;
