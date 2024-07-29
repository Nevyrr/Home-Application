const Icon = ({ imageName}) => {
    return (
        <div className="icon">
            <img src={`/images/${imageName}`}/>
        </div>
    );
};

export default Icon;