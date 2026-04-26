type Theme = {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
};

type ThemeColors = {
    [Key in keyof Theme as `color${Capitalize<Key>}`]: Theme[Key];
};

function getThemeColors(): ThemeColors {
    return {
        colorPrimary: "#007bff",
        colorSecondary: "#6c757d",
        colorSuccess: "#28a745",
        colorDanger: "#dc3545"
    };
}

const colors = getThemeColors();
console.log(colors.colorPrimary);
