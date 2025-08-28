package com.moh.yehia.testing.controller;

import com.moh.yehia.testing.exception.InvalidRequestException;
import com.moh.yehia.testing.model.Category;
import com.moh.yehia.testing.model.CategoryRequest;
import com.moh.yehia.testing.service.design.CategoryService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @Nested
    class FindAllTests {
        @Test
        void should_ReturnEmptyList_When_NoCategoriesExist() {
            when(categoryService.findAll()).thenReturn(List.of());
            List<Category> result = categoryController.findAll();
            assertEquals(0, result.size());
            verify(categoryService).findAll();
        }

        @Test
        void should_ReturnListOfCategories_When_CategoriesExist() {
            Category category1 = new Category("1", "Name1", "Description1");
            Category category2 = new Category("2", "Name2", "Description2");
            when(categoryService.findAll()).thenReturn(List.of(category1, category2));
            List<Category> result = categoryController.findAll();
            assertEquals(2, result.size());
            assertEquals(category1, result.get(0));
            assertEquals(category2, result.get(1));
            verify(categoryService).findAll();
        }
    }

    @Nested
    class FindByIdTests {
        @Test
        void should_ReturnCategory_When_CategoryExists() {
            Category category = new Category("1", "Name1", "Description1");
            when(categoryService.findById("1")).thenReturn(category);
            Category result = categoryController.findById("1");
            assertEquals(category, result);
            verify(categoryService).findById("1");
        }

        @Test
        void should_ThrowInvalidRequestException_When_CategoryDoesNotExist() {
            when(categoryService.findById("1")).thenReturn(null);
            assertThrows(InvalidRequestException.class, () -> categoryController.findById("1"));
            verify(categoryService).findById("1");
        }

        @Test
        void should_ThrowInvalidRequestException_When_IdIsNullOrEmpty(){
            assertThrows(InvalidRequestException.class, ()-> categoryController.findById(null));
            assertThrows(InvalidRequestException.class, ()-> categoryController.findById(""));
            verify(categoryService, never()).findById(anyString());

        }
    }

    @Nested
    class SaveTests {
        @Test
        void should_SaveCategory_When_RequestIsValid() {
            CategoryRequest categoryRequest = new CategoryRequest("Name1", "Description1");
            Category category = new Category("1", "Name1", "Description1");
            when(categoryService.save(categoryRequest)).thenReturn(category);
            Category result = categoryController.save(categoryRequest);
            assertEquals(category, result);
            ArgumentCaptor<CategoryRequest> captor = ArgumentCaptor.forClass(CategoryRequest.class);
            verify(categoryService).save(captor.capture());
            assertEquals("Name1", captor.getValue().getName());
            assertEquals("Description1", captor.getValue().getDescription());
        }

        @Test
        void should_ThrowException_When_RequestIsInvalid(){
            CategoryRequest categoryRequest = new CategoryRequest("", "");
            assertThrows(javax.validation.ConstraintViolationException.class, () -> categoryController.save(categoryRequest));
            verify(categoryService, never()).save(any(CategoryRequest.class));
        }
    }
}