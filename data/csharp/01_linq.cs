using System;
using System.Linq;
using System.Collections.Generic;

public class LinqDemo
{
    public static void Main()
    {
        var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        
        var evens = numbers.Where(n => n % 2 == 0)
                          .Select(n => n * n)
                          .ToList();
                          
        foreach (var n in evens)
        {
            Console.WriteLine(n);
        }
    }
}
