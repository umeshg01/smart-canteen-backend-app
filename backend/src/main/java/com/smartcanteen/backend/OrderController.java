package com.smartcanteen.backend;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.smartcanteen.backend.repository.OrderRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/test")
    public String testOrder() {
        return "Smart Canteen Order API is working!";
    }

    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/export")
    public String exportOrders() {
        exportOrdersToCSV();
        return "CSV export completed. Check the backend terminal for the file location.";
}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(@RequestBody Order order) {

        if (order.getQuantity() <= 0 ||
                order.getFoodName() == null ||
                order.getFoodName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Food name and valid quantity are required");
        }

        order.setStatus("Pending");

        Order savedOrder = orderRepository.save(order);

        // Export all existing orders, including the newly saved order.
        exportOrdersToCSV();

        return savedOrder;
    }

    private void exportOrdersToCSV() {

        List<Order> orders = orderRepository.findAll();

        Path csvPath = Paths.get(
                System.getProperty("user.dir"),
                "src", "DATA", "orders.csv").toAbsolutePath();

        System.out.println("CSV file location: " + csvPath);
        System.out.println("Total orders to export: " + orders.size());

        try {
            Files.createDirectories(csvPath.getParent());

            try (var writer = Files.newBufferedWriter(
                    csvPath,
                    StandardCharsets.UTF_8)) {

                writer.write(
                        "orderId,customerName,foodName,quantity,totalPrice,status");
                writer.newLine();

                for (Order order : orders) {
                    writer.write(
                            order.getId() + "," +
                            csvValue(order.getCustomerName()) + "," +
                            csvValue(order.getFoodName()) + "," +
                            order.getQuantity() + "," +
                            order.getTotalPrice() + "," +
                            csvValue(order.getStatus()));
                    writer.newLine();
                }
            }

            System.out.println("CSV export completed successfully.");

        } catch (IOException e) {
            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "CSV export failed. Check the backend terminal for details.",
                    e);
        }
    }

    private String csvValue(String value) {
        if (value == null) {
            return "";
        }

        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}