public class RTLFormatter {
    
    /**
     * Reverses the string character by character for RTL display in terminal
     * This only affects display - internal storage remains unchanged
     */
    public static String rtl(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return new StringBuilder(text).reverse().toString();
    }
}