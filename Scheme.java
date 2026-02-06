public class Scheme {
    String nom;
    String pattern;

    public Scheme(String nom, String pattern) {
        this.nom = nom;
        this.pattern = pattern;
    }

    public String generate(String racine) {
        if (racine == null || racine.length() != 3)
            return null;

        String result = pattern;
        // استبدال الحروف الثلاثة فقط
        result = result.replace("_1", String.valueOf(racine.charAt(0)));
        result = result.replace("_2", String.valueOf(racine.charAt(1)));
        result = result.replace("_3", String.valueOf(racine.charAt(2)));

        return result;
    }
}
