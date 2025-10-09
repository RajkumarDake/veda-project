import os

def get_article_filenames():
    """
    Get all file names from the data/article folder and save them to a results file.
    """
    # Define the path to the article folder
    article_folder = "data/article"
    
    # Define the output file path
    output_file = "article_filenames_result.txt"
    
    try:
        # Get all files in the article directory
        if os.path.exists(article_folder):
            filenames = os.listdir(article_folder)
            
            # Filter only files (not directories)
            filenames = [f for f in filenames if os.path.isfile(os.path.join(article_folder, f))]
            
            # Sort the filenames for better organization
            filenames.sort()
            
            # Save all filenames to the result file
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write("Article File Names List\n")
                f.write("=" * 50 + "\n\n")
                
                for i, filename in enumerate(filenames, 1):
                    f.write(f"{i}. {filename}\n")
                
                f.write(f"\nTotal files: {len(filenames)}")
            
            print(f"Successfully saved {len(filenames)} filenames to '{output_file}'")
            print(f"Files found in '{article_folder}':")
            print("=" * 50)
            
            # Display all files
            for i, filename in enumerate(filenames, 1):
                print(f"{i}. {filename}")
            
            print("=" * 50)
            print(f"Total files displayed: {len(filenames)}")
                
        else:
            print(f"Error: Directory '{article_folder}' does not exist!")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_article_filenames()
