
package com.smartcanteen.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcanteen.backend.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

}
