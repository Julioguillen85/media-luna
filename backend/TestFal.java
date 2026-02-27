import java.util.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

public class TestFal {
    public static void main(String[] args) {
        String apiKey = "7dae09c8-c930-46f7-8b63-e47a23055887:eb9868f662b2ecfd340c3f4d3eb929dd";
        RestTemplate restTemplate = new RestTemplate();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Key " + apiKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("prompt", "Professional marketing food photography for social media advertising. Mexican snack bar called Media Luna. The main product featured is: Tostilocos. Vibrant colorful, warm golden hour lighting.");
            body.put("image_size", "square_hd");
            body.put("num_images", 1);
            body.put("enable_safety_checker", true);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://fal.run/fal-ai/flux-pro/v1.1", entity, Map.class);
            System.out.println("Status: " + response.getStatusCode());
            System.out.println("Response: " + response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
