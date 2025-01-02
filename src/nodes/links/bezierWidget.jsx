const BezierLinkWidget = ({ link }) => {
  
  // Verifica se os métodos RenderPaths e RenderPoints existem
  const Paths = link?.RenderPaths;
  const Points = link?.RenderPoints;

  return (
    <g>
      {Paths && <Paths />}
      {Points && <Points />}
    </g>
  );
};

export default BezierLinkWidget;
