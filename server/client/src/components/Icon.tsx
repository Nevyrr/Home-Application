interface IconProps {
  imageName: string;
}

const Icon = ({ imageName }: IconProps) => {
    return (
        <div className="icon">
            <img src={`/images/${imageName}`} alt={imageName} />
        </div>
    );
};

export default Icon;

