export function Divider({ dashed = false }) {
  return (
    <div
      style={{
        borderTop: dashed ? "1px dashed #2D3748" : "1px solid #1E2A38",
        margin: "0",
      }}
    />
  );
}